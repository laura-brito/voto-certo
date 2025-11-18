export interface ListItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  author: string;
  description: string;
  href?: string;
}

export type PageName = "proposicoes" | "deputados";
