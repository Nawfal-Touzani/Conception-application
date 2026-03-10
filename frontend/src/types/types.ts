// Boilerplate
export interface Pizza {
  id?: number;
  title: string;
  content: string;
}
export interface NewPizza {
  title: string;
  content: string;
}
export interface Drink {
  title: string;
  volume: string;
  price: string;
}
export interface PizzeriaContext {
  pizzas: Pizza[];
  drinks: Drink[];
}
export interface UserContextType {
  registerUser?: (email: string, password: string) => Promise<void>;
  loginUser?: (email: string, password: string) => Promise<void>;
}
export interface AuthContextType {
  loginMember?: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
}
