/**
 * Mopar API Client
 *
 * Handles all API communication with Mopar services
 */

const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const qs = require('querystring');

class MoparAPI {
  constructor(cookies, log = console.log, debugMode = false) {
    this.log = log;
    this.debugMode = debugMode;
    this.baseURL = 'https://www.mopar.com';
    this.csrfToken = null;
    this.csrfTokenTimestamp = null;

    this.debug('MoparAPI constructor called');

    if (!cookies) {
      this.log('ERROR: cookies is undefined or null');
      throw new Error('Cookies parameter is required');
    }

    this.debug(`Received ${Object.keys(cookies).length} cookies`);

    // Setup cookie jar
    this.cookieJar = new tough.CookieJar();
    this.setCookies(cookies);

    // Create HTTP client
    this.session = wrapper(
      axios.create({
        jar: this.cookieJar,
        withCredentials: true,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
      })
    );
  }

  // Debug logging helper
  debug(message) {
    if (this.debugMode) {
      this.log(`[DEBUG] ${message}`);
    }
  }

  setCookies(cookies) {
    const cookieNames = Object.keys(cookies);
    this.log(`Setting ${cookieNames.length} cookies in jar`);

    let gltCount = 0;
    Object.entries(cookies).forEach(([name, value]) => {
      if (name.startsWith('glt_')) {
        gltCount++;
        this.debug(`Setting glt_ cookie: ${name} = ${value.substring(0, 20)}...`);
      }

      // Create cookie string instead of Cookie object
      const cookieString = `${name}=${value}; Domain=.mopar.com; Path=/; Secure${name.startsWith('glt_') || name.startsWith('gac_') ? '; HttpOnly' : ''}`;

      try {
        const result = this.cookieJar.setCookieSync(cookieString, 'https://www.mopar.com', {
          loose: true,
          ignoreError: false,
        });

        if (!result) {
          this.debug(`WARNING: setCookieSync returned null for ${name}`);
        } else if (name.startsWith('glt_')) {
          this.debug(`Successfully set glt_ cookie, result type: ${typeof result}`);
        }
      } catch (e) {
        this.log(`ERROR: Failed to set cookie ${name}: ${e.message}`);
      }
    });

    this.log(`Successfully set ${gltCount} glt_ cookie(s)`);
  }

  async initialize() {
    // Get CSRF token
    try {
      await this.getCSRFToken();
    } catch (e) {
      this.debug(`Warning: Could not get CSRF token: ${e.message}`);
    }

    // Initialize profile - this wakes up the backend and loads account data!
    try {
      await this.getProfile();
      this.log('Profile initialized');
    } catch (e) {
      this.log(`ERROR: Failed to initialize profile: ${e.message}`);
      this.debug('This usually means the session cookies are invalid or expired');
      throw e; // Re-throw so caller knows initialization failed
    }
  }

  async getCSRFToken() {
    const response = await this.session.get(`${this.baseURL}/moparsvc/token`, {
      headers: {
        Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
      },
    });
    this.csrfToken = response.data.token;
    this.csrfTokenTimestamp = Date.now();
    this.debug(`CSRF token refreshed: ${this.csrfToken?.substring(0, 20)}...`);
    return this.csrfToken;
  }

  /**
   * Ensure CSRF token is fresh (refresh if older than 10 minutes or missing)
   */
  async ensureFreshCSRFToken() {
    const TEN_MINUTES = 10 * 60 * 1000;
    const now = Date.now();

    if (!this.csrfToken || !this.csrfTokenTimestamp || now - this.csrfTokenTimestamp > TEN_MINUTES) {
      this.debug('CSRF token missing or stale, refreshing...');
      try {
        await this.getCSRFToken();
      } catch (error) {
        this.log(`WARNING: Failed to refresh CSRF token: ${error.message}`);
        // Continue anyway - the token might still work
      }
    }
  }

  async getProfile() {
    const url = `${this.baseURL}/moparsvc/user/getProfile`;
    const timestamp = Date.now();

    const response = await this.session.get(`${url}?timestamp=${timestamp}`, {
      headers: {
        Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.debug(`Profile loaded: ${JSON.stringify(response.data).substring(0, 200)}`);

    // Check for error response
    if (response.data && (response.data.status === 'failed' || response.data.errorCode)) {
      const errorMsg = response.data.errorDesc || response.data.msg || 'Unknown error';
      throw new Error(`Profile request failed: ${errorMsg} (${response.data.errorCode || 'no code'})`);
    }

    return response.data;
  }

  /**
   * NOTE: Currently unused - kept as placeholder for future features
   * Initialize Gigya session using login token
   */
  async initializeGigya() {
    // Extract login token from cookies
    const cookies = await this.cookieJar.getCookies('https://www.mopar.com');

    // Debug: log all cookie keys
    this.debug(`Checking ${cookies.length} cookies in jar`);
    const cookieKeys = cookies.map((c) => c.key).sort();
    this.debug(`Cookie keys in jar: ${cookieKeys.join(', ')}`);

    const gltCookie = cookies.find((c) => c.key.startsWith('glt_'));

    if (!gltCookie) {
      this.log('ERROR: No glt_ cookie found in cookieJar');
      throw new Error('No Gigya login token found in cookies');
    }

    this.debug(`Found Gigya token: ${gltCookie.key}`);
    this.debug(`Token value (first 20 chars): ${gltCookie.value.substring(0, 20)}`);

    const requestBody = {
      include: 'profile,data',
      lang: 'en',
      APIKey: '4_z5ouAf50NbNHhxdqDSqZhQ',
      sdk: 'js_latest',
      login_token: gltCookie.value,
    };

    this.debug('Calling Gigya getAccountInfo with login_token...');

    const response = await this.session.post(
      'https://login.mopar.com/accounts.getAccountInfo',
      qs.stringify(requestBody),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://www.mopar.com/',
          Origin: 'https://www.mopar.com',
        },
      }
    );

    this.debug(
      `Gigya response: errorCode=${response.data.errorCode}, errorMessage=${response.data.errorMessage || 'none'}`
    );

    if (response.data.errorCode !== 0) {
      this.log(`Full Gigya response: ${JSON.stringify(response.data)}`);
      throw new Error(`Gigya error: ${response.data.errorMessage}`);
    }

    return response.data;
  }

  async getVehicles() {
    this.debug('Fetching vehicles from API...');

    const url = `${this.baseURL}/moparsvc/user/getVehicles`;

    // Retry logic: The Mopar backend takes several seconds to propagate the session
    // and make vehicle data available after login
    const maxRetries = 4;
    const retryDelay = 3000; // 3 seconds between retries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (attempt > 1) {
        this.debug(`Retry attempt ${attempt}/${maxRetries} after ${retryDelay}ms delay...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      const response = await this.session.get(url, {
        headers: {
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      this.debug(
        `Response status=${response.status}, data type=${typeof response.data}, data=${JSON.stringify(response.data).substring(0, 200)}`
      );

      const vehicles = Array.isArray(response.data) ? response.data : response.data.vehicles || [];

      if (vehicles.length > 0) {
        this.debug(`Found ${vehicles.length} vehicle(s) on attempt ${attempt}`);
        return vehicles;
      }

      this.debug(`Attempt ${attempt}: No vehicles found yet (empty response)`);
    }

    this.debug(`No vehicles found after ${maxRetries} attempts`);
    return [];
  }

  async getVehiclesQuick() {
    // Quick single attempt without retries - for fast startup with cache fallback
    const url = `${this.baseURL}/moparsvc/user/getVehicles`;

    const response = await this.session.get(url, {
      headers: {
        Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const vehicles = Array.isArray(response.data) ? response.data : response.data.vehicles || [];
    return vehicles;
  }

  /**
   * NOTE: Currently returns stub - real-time status updates planned for future
   * Get current vehicle status (doors, locks, engine, etc.)
   */
  async getVehicleStatus(_vin) {
    return { available: false, error: 'Real-time status requires vehicle wakeup' };
  }

  /**
   * NOTE: Currently unused - kept as placeholder for future VHR feature
   * Get Vehicle Health Report
   */
  async getVehicleHealth(vin) {
    try {
      const response = await this.session.get(`${this.baseURL}/moparsvc/getVHR`, {
        params: { vin },
        headers: {
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { available: false, error: 'Health endpoint not available' };
      }
      throw error;
    }
  }

  /**
   * NOTE: Currently unused - kept as placeholder for future location tracking
   * Get vehicle GPS location
   */
  async getVehicleLocation(vin) {
    try {
      const response = await this.session.get(`${this.baseURL}/moparsvc/connect/location`, {
        params: { vin },
        headers: {
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { available: false, error: 'Location endpoint not available' };
      }
      throw error;
    }
  }

  /**
   * NOTE: Currently unused - kept as placeholder for future real-time updates
   * Request vehicle to refresh its status
   */
  async refreshVehicleStatus(vin) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(`${this.baseURL}/moparsvc/connect/refresh`, qs.stringify({ vin }), {
      headers: {
        'mopar-csrf-salt': this.csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
      },
    });
    return response.data;
  }

  async sendCommand(vin, action, pin) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(
      `${this.baseURL}/moparsvc/connect/lock`,
      qs.stringify({ action, pin, vin }),
      {
        headers: {
          'mopar-csrf-salt': this.csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        },
      }
    );

    if (!response.data.serviceRequestId) {
      throw new Error('No service request ID received');
    }

    return response.data.serviceRequestId;
  }

  async startEngine(vin, pin) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(
      `${this.baseURL}/moparsvc/connect/engine`,
      qs.stringify({ action: 'START', pin, vin }),
      {
        headers: {
          'mopar-csrf-salt': this.csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        },
      }
    );
    return response.data.serviceRequestId;
  }

  async stopEngine(vin, pin) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(
      `${this.baseURL}/moparsvc/connect/engine`,
      qs.stringify({ action: 'STOP', pin, vin }),
      {
        headers: {
          'mopar-csrf-salt': this.csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        },
      }
    );
    return response.data.serviceRequestId;
  }

  async hornAndLights(vin) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(`${this.baseURL}/moparsvc/connect/hornlights`, qs.stringify({ vin }), {
      headers: {
        'mopar-csrf-salt': this.csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
      },
    });
    return response.data.serviceRequestId;
  }

  async setClimate(vin, pin, temperature, duration = 10) {
    await this.ensureFreshCSRFToken();

    const response = await this.session.post(
      `${this.baseURL}/moparsvc/connect/climate`,
      qs.stringify({ vin, pin, temperature, duration }),
      {
        headers: {
          'mopar-csrf-salt': this.csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.mopar.com/chrysler/en-us/my-vehicle/dashboard.html',
        },
      }
    );
    return response.data.serviceRequestId;
  }

  async pollCommandStatus(vin, action, serviceRequestId, maxAttempts = 15) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await this.session.get(`${this.baseURL}/moparsvc/connect/lock`, {
        params: { remoteServiceRequestID: serviceRequestId, vin, action },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      const status = response.data.status;

      if (status === 'SUCCESS') {
        return { success: true, status };
      } else if (status === 'FAILED') {
        return { success: false, status };
      }
    }

    return { success: false, status: 'TIMEOUT' };
  }

  /**
   * Log user-friendly error messages based on error type
   * @param {string} operation - What was being attempted
   * @param {Error} error - The error that occurred
   */
  logFriendlyError(operation, error) {
    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      this.log('ERROR: Cannot reach Mopar API - Check your internet connection');
      this.debug(`${operation} failed: ${error.message}`);
    }
    // HTTP status code errors
    else if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || 'unknown';

      if (status === 401) {
        this.log('ERROR: Authentication failed - Your session has expired');
        this.log('Please wait while we re-authenticate automatically...');
      } else if (status === 403) {
        this.log('ERROR: Access forbidden - Session or permissions issue');
        this.log('This usually resolves automatically on retry');
      } else if (status === 429) {
        this.log('ERROR: Too many requests to Mopar API');
        this.log('Please wait a few minutes before trying again');
      } else if (status === 500 || status === 502 || status === 503) {
        this.log(`ERROR: Mopar server error (${status}) - Their servers may be down`);
        this.log('This is temporary - try again in a few minutes');
      } else if (status === 404) {
        this.log('ERROR: API endpoint not found');
        this.debug(`URL: ${url}`);
      } else {
        this.log(`ERROR: ${operation} failed with HTTP ${status}`);
        this.debug(`URL: ${url}, Message: ${error.message}`);
      }
    }
    // Request made but no response
    else if (error.request) {
      this.log('ERROR: No response from Mopar API - Network timeout');
      this.log('Check your internet connection or try again later');
    }
    // Something else
    else {
      this.log(`ERROR: ${operation} failed: ${error.message}`);
    }

    // Always log full stack in debug mode
    this.debug(`Full error: ${error.stack}`);
  }
}

module.exports = MoparAPI;
