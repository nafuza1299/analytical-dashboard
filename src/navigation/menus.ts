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

// Switching tabs only ever changes the page-scoped `indicator` filter — never
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

/** Reverse-lookup so the active menu/tab highlight can be derived from the
 * URL-backed `indicator` filter instead of duplicating it in local state —
 * a shared link with `?indicator=...` then highlights the right tab too. */
export function findTabByIndicator(indicatorCode: string): { menu: MenuDef; tab: TabDef } | undefined {
  for (const menu of MENUS) {
    const tab = menu.tabs.find((t) => t.indicatorCode === indicatorCode)
    if (tab) return { menu, tab }
  }
  return undefined
}
