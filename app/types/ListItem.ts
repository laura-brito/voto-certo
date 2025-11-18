export interface ListItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  author: string;
  description: string;
  href?: string;
  ementa?: string;
}

export type PageName = "proposicoes" | "deputados";
