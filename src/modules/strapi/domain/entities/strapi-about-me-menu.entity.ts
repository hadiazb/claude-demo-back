export class StrapiAboutMeMenu {
  constructor(
    public readonly id: number,
    public readonly enable: boolean,
    public readonly order: number,
    public readonly menuName: string,
    public readonly menuType: string,
    public readonly country: string,
    public readonly maintenance_mode: boolean,
    public readonly title?: string,
    public readonly description?: string,
    public readonly locale?: string,
  ) {}
}
