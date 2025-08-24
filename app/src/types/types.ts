
import type { Event as RBCEvent } from 'react-big-calendar';

export interface Event extends RBCEvent {
  start: Date
  end: Date,
  title: string
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}