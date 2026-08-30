export interface TabDef {
  key: string
  label: string
  indicatorCode: string
}

export interface MenuDef {
  key: string
  label: string
  tabs: TabDef[]
}

// Switching menus/tabs only ever changes the route (path + `?tab=`) — never
// countries/yearRange — which is what makes cross-page filter persistence
// visibly do something.
export const MENUS: MenuDef[] = [
  {
    key: 'economy',
    label: 'Economy',
    tabs: [
      { key: 'gdp', label: 'GDP', indicatorCode: 'NY.GDP.MKTP.CD' },
      { key: 'inflation', label: 'Inflation', indicatorCode: 'FP.CPI.TOTL.ZG' },
      { key: 'trade', label: 'Trade', indicatorCode: 'NE.TRD.GNFS.ZS' },
    ],
  },
  {
    key: 'health',
    label: 'Health',
    tabs: [
      { key: 'life-expectancy', label: 'Life Expectancy', indicatorCode: 'SP.DYN.LE00.IN' },
      { key: 'mortality', label: 'Mortality', indicatorCode: 'SP.DYN.IMRT.IN' },
      { key: 'spending', label: 'Spending', indicatorCode: 'SH.XPD.CHEX.GD.ZS' },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    tabs: [
      { key: 'enrollment', label: 'Enrollment', indicatorCode: 'SE.PRM.ENRR' },
      { key: 'literacy', label: 'Literacy', indicatorCode: 'SE.ADT.LITR.ZS' },
      { key: 'spending', label: 'Spending', indicatorCode: 'SE.XPD.TOTL.GD.ZS' },
    ],
  },
  {
    key: 'environment',
    label: 'Environment',
    tabs: [
      { key: 'co2', label: 'CO₂', indicatorCode: 'EN.GHG.CO2.MT.CE.AR5' },
      { key: 'energy', label: 'Energy', indicatorCode: 'EG.USE.PCAP.KG.OE' },
      { key: 'forest', label: 'Forest', indicatorCode: 'AG.LND.FRST.K2' },
    ],
  },
]

/** Resolves the active menu/tab from the URL path (menu key) and `tab` query
 * param, falling back to the first tab of the matched menu (or the first
 * menu/tab overall) when the path or tab is missing/unknown — e.g. a bare
 * `/` or a stale link. */
export function resolveRoute(pathname: string, tabKey: string | null): { menu: MenuDef; tab: TabDef } {
  const menuKey = pathname.split('/').filter(Boolean)[0]
  const menu = MENUS.find((m) => m.key === menuKey) ?? MENUS[0]
  const tab = menu.tabs.find((t) => t.key === tabKey) ?? menu.tabs[0]
  return { menu, tab }
}
