export class RegisterTherapistDto {
  firstName: string;
  middleName?: string;
  lastName?: string;

  email: string;
  phone: string;
  password: string;

  birthDate?: string;
  gender?: string;

  country?: string;
  city?: string;
  address?: string;

  therapies?: any[];
  certificates?: any[];
  workingHours?: any;

  notifications?: {
    message1?: string;
    time1?: number;
    message2?: string;
    time2?: number;
  };

  createSelfClient?: boolean;

  secure?: Record<string, boolean>;
}
