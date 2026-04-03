export interface Speciality {
  id: number;
  name: string;
}

export interface SpecialityMenuProps {
  specialities: Speciality[];
  selectedId: number | '';
  onChange: (id: number) => void;
}

export interface SpecialitySelectProps {
  currentSpeciality: string;
  onUpdate: (name: string) => Promise<void>;
}
