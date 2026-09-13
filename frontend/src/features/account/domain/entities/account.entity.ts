export interface AccountEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Format AAAA-MM-JJ, directement exploitable par un <input type="date">. */
  birthDate: string;
}
