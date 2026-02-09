export class StrapiTabsMenu {
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly enabled: boolean,
    public readonly icon: string,
    public readonly route: string,
    public readonly menuId: string,
    public readonly menuName: string,
    public readonly menuType: string,
    public readonly country: string,
    public readonly description?: string,
    public readonly fontSize?: string,
    public readonly locale?: string,
  ) {}
}
