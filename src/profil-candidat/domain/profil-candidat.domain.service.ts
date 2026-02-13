export type ProfilCandidatCompletionInput = {
  nom?: string | null;
  prenom?: string | null;
  photo?: string | null;
  paysId?: string | null;
  ville?: string | null;
  adresse?: string | null;
  resume?: string | null;
  anneesExperience?: number | null;
};

export type ProfilCandidatTelephoneInput = {
  telephone: string;
  isPhonePrincipal?: boolean;
};

export class ProfilCandidatDomainService {
  isProfileCompleted(input: ProfilCandidatCompletionInput): boolean {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.paysId?.trim() &&
      !!input.ville?.trim() &&
      !!input.adresse?.trim() &&
      !!input.resume?.trim() &&
      input.anneesExperience !== undefined &&
      input.anneesExperience !== null
    );
  }

  countPrimaryPhones(telephones?: ProfilCandidatTelephoneInput[]) {
    if (!telephones || telephones.length === 0) return 0;
    return telephones.filter((tel) => tel.isPhonePrincipal).length;
  }
}
