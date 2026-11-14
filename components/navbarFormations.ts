export interface NavbarWorkshop {
  id: string;
  title: string;
  href: string;
  price: number;
  spots?: number;
  schedule: string;
  time?: string;
}

export interface NavbarCourse {
  id: string;
  title: string;
  href: string;
  price: number;
  totalClasses: number;
  totalHours: number;
}
