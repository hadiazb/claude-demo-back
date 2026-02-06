export interface StrapiModuleTitle {
  title: string;
  show: boolean;
}

export interface StrapiModuleAction {
  name?: string;
  description?: string;
  type?: string;
  [key: string]: unknown;
}

export interface StrapiModuleDataObjects {
  backend: unknown;
  frontend: unknown;
}

export interface StrapiModuleConfig {
  uid: string;
  moduleName: string;
  title: StrapiModuleTitle;
  moduleId: string;
  description: string;
  country: string[];
  actions: StrapiModuleAction[];
  form_objects: StrapiModuleAction[];
  formatting: unknown;
  dataObjects: StrapiModuleDataObjects;
}

export class StrapiModule {
  constructor(
    public readonly documentId: string,
    public readonly config: StrapiModuleConfig,
    public readonly locale?: string,
  ) {}
}
