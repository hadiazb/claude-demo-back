/**
 * Interface representing the title configuration of a Strapi module.
 * Controls the display title and its visibility.
 */
export interface StrapiModuleTitle {
  /** The display title text of the module */
  title: string;
  /** Whether the title should be visible in the UI */
  show: boolean;
}

/**
 * Interface representing an action or form object within a Strapi module.
 * Actions define operations that can be performed within the module context.
 */
export interface StrapiModuleAction {
  /** Name identifier of the action */
  name?: string;
  /** Human-readable description of the action */
  description?: string;
  /** Type classification of the action */
  type?: string;
  /** Additional dynamic properties */
  [key: string]: unknown;
}

/**
 * Interface representing the data objects configuration for a Strapi module.
 * Separates backend and frontend data object definitions.
 */
export interface StrapiModuleDataObjects {
  /** Backend-specific data object configuration */
  backend: unknown;
  /** Frontend-specific data object configuration */
  frontend: unknown;
}

/**
 * Interface representing the full configuration of a Strapi module.
 * Contains all metadata, actions, and structural information for the module.
 */
export interface StrapiModuleConfig {
  /** Unique identifier for the module configuration */
  uid: string;
  /** Name identifier of the module */
  moduleName: string;
  /** Title configuration with display settings */
  title: StrapiModuleTitle;
  /** Unique module identifier */
  moduleId: string;
  /** Human-readable description of the module */
  description: string;
  /** List of country codes where the module is available */
  country: string[];
  /** Available actions within the module */
  actions: StrapiModuleAction[];
  /** Form object definitions for the module */
  form_objects: StrapiModuleAction[];
  /** Formatting configuration for the module */
  formatting: unknown;
  /** Backend and frontend data object definitions */
  dataObjects: StrapiModuleDataObjects;
}

/**
 * Domain entity representing a Strapi CMS module.
 * Encapsulates the module's document identity, configuration, and locale.
 * Modules are the primary content units retrieved from the Strapi API.
 */
export class StrapiModule {
  /**
   * Creates a new StrapiModule instance.
   * @param documentId - The Strapi document identifier for this module
   * @param config - The full module configuration including metadata and actions
   * @param locale - Optional locale code for internationalized content
   */
  constructor(
    public readonly documentId: string,
    public readonly config: StrapiModuleConfig,
    public readonly locale?: string,
  ) {}
}
