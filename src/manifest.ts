import fs from 'fs-extra';
import path from 'path';

interface ManifestChrome {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  homepage_url: string;
  action: {
    default_popup: string;
  };
  options_ui: {
    page: string;
    open_in_tab: boolean;
  };
  background: {
    service_worker: string;
    type: string;
  };
  host_permissions: string[];
  icons: {
    [key: number]: string;
  };
  permissions: string[];
  web_accessible_resources?: Array<{
    matches: string[];
    resources: string[];
  }>;
  commands?: {
    [key: string]: {
      suggested_key: {
        default: string;
        mac?: string;
        windows?: string;
        chromeos?: string;
        linux?: string;
      };
      description: string;
    };
  };
}

interface ManifestFirefox {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  homepage_url: string;
  browser_action: {
    default_popup: string;
    default_icon: {
      [key: number]: string;
    }
    default_title: string;
  };
  options_ui: {
    page: string;
    browser_style: boolean;
    open_in_tab: boolean;
  };
  icons: {
    [key: number]: string;
  };
  permissions: string[];
  background: {
    scripts: string[];
    persistent: boolean;
    type: string;
  };
  browser_specific_settings: {
    gecko: {
      id: string;
      strict_min_version: string;
    }
  }
}

const createBaseChromeManifest = async (): Promise<ManifestChrome> => {
  try {
    const pkg = await fs.readJSON('package.json');

    return {
      manifest_version: 3,
      name: pkg.longName ?? pkg.name ?? 'GIVE ME A NAME',
      version: pkg.version,
      description: pkg.description ?? 'GIVE ME A DESCRIPTION',
      homepage_url: 'https://github.com/Tidone/linkwarden-viewer',
      action: {
        default_popup: './src/scripts/popup/popup.html',
      },
      options_ui: {
        page: './src/scripts/options/options.html',
        open_in_tab: true,
      },
      background: {
        service_worker: 'js/service-worker.js',
        type: 'module',
      },
      icons: {
        16: './assets/icon-16.png',
        48: './assets/icon-48.png',
        128: './assets/icon-128.png',
      },
      permissions: ['webRequest', 'storage', 'alarms', 'tabs', 'activeTab'],
      host_permissions: ["*://*/*"],
      commands: {
        refresh_extension: {
          suggested_key: {
            default: 'Ctrl+Space',
          },
          description: 'Refresh Extension', // https://developer.chrome.com/docs/extensions/reference/commands/
        },
      },
    };
  } catch (error) {
    console.error('Error reading package.json: ', error);
    throw error;
  }
};

const createBaseFirefoxManifest = async (): Promise<ManifestFirefox> => {
  try {
    const pkg = await fs.readJSON('package.json');

    return {
      manifest_version: 2,
      name: pkg.longName ?? pkg.name ?? 'GIVE ME A NAME',
      version: pkg.version,
      description: pkg.description ?? 'GIVE ME A DESCRIPTION',
      homepage_url: 'https://github.com/Tidone/linkwarden-viewer',
      browser_action: {
        default_popup: './src/scripts/popup/popup.html',
        default_icon: {
          16: './assets/icon-16.png',
          48: './assets/icon-48.png',
          128: './assets/icon-128.png',
        },
        default_title: pkg.longName ?? pkg.name ?? 'GIVE ME A NAME',
      },
      options_ui: {
        page: './src/scripts/options/options.html',
        browser_style: false,
        open_in_tab: true,
      },
      background: {
        scripts: ['js/service-worker.js'],
        persistent: true,
        type: 'module',
      },
      icons: {
        16: './assets/icon-16.png',
        48: './assets/icon-48.png',
        128: './assets/icon-128.png',
      },
      permissions: [
        'storage',
        'activeTab',
        'tabs',
        '<all_urls>',
        'webRequest',
        'http://*/*',
        'https://*/*'
      ],
      browser_specific_settings: {
        gecko: {
          id: "linkwarden_viewer@tidone",
          strict_min_version: "112.0"
        }
      }
    };
  } catch (error) {
    console.error('Error reading package.json: ', error);
    throw error;
  }
};

const getManifest = async (resources: string[]): Promise<ManifestChrome | ManifestFirefox> => {
  try {
    const target = process.env.TARGET_BROWSER;

    if (target === 'CHROME') {
      const baseManifest = await createBaseChromeManifest();
      return {
      ...baseManifest,
      web_accessible_resources: [
        {
          matches: ['https://*/*', 'http://*/*'],
          resources,
        },
      ],
    };
    } else if (target === 'FIREFOX') {
      return await createBaseFirefoxManifest();
    } else {
      console.error('Error creating manifest: No target browser specified');
      throw 'No target browser specified';
    }


  } catch (error) {
    console.error('Error creating manifest: ', error);
    throw error;
  }
};

const readJsFiles = async (dir: string): Promise<string[]> => {
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((file: string) => path.extname(file) === '.js')
      .map((file: string) => path.join(dir, file));
  } catch (error) {
    console.error(`Error reading JS files from ${dir}: `, error);
    throw error;
  }
};

export const writeManifest = async (): Promise<void> => {
  try {
    const dir = 'dist/js';
    const files = await readJsFiles(dir);

    const manifest = await getManifest(files);

    fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.error('Issue writing manifest.json: ', error);
    throw error;
  }
};
