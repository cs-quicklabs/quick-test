// Base interface for user-related properties
export interface UserBase {
    firstName: string;
    lastName: string;
    email: string;
    org: string;
}

// Extended interface for form-specific properties
export interface SignUpFormValues extends UserBase {
    password: string;
    cnfpassword: string;
    termAndCondition: boolean;
}

// Initial values for the signup form
export const initialSignUpValues: SignUpFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    org: "",
    password: "",
    cnfpassword: "",
    termAndCondition: false,
};

// Interface for reusable input field props
export interface InputFieldProps {
    type: string;
    name: keyof SignUpFormValues; // Restrict to valid form field keys
    label: string;
    validation?: boolean
}

export interface ISignInInputFieldProps {
    email: string;
    password: string;
    remember_me: boolean;
};

export const SignInInitialValues: ISignInInputFieldProps = {
    email: "",
    password: "",
    remember_me: false,
};

export interface ILoginResponse {
    address1?: string
    address2?: string
    archivedByUser?: string
    city?: string
    country?: string
    createdAt?: string
    deletedAt?: string
    email: string
    firstName: string
    freeTrialStartDate?: string
    id: string
    isVerified?: boolean
    language: string
    lastName: string
    organization: string
    phone?: string
    postalCode?: string
    profileImage?: string
    role: { id: string, roleType: string, createdAt: string, updatedAt: string }
    roleId: string
    state?: string
    subscriptionStatus?: string
    title?: string
    updatedAt?: string
}