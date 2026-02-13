export type ProfilRecruteurCompletionInput = {
  nom?: string | null;
  prenom?: string | null;
  photo?: string | null;
  fonction?: string | null;
};

export type ProfilRecruteurTelephoneInput = {
  telephone: string;
  isPhonePrincipal?: boolean;
};

export class ProfilRecruteurDomainService {
  isProfileCompleted(input: ProfilRecruteurCompletionInput): boolean {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.fonction?.trim()
    );
  }

  countPrimaryPhones(telephones?: ProfilRecruteurTelephoneInput[]) {
    if (!telephones || telephones.length === 0) return 0;
    return telephones.filter((tel) => tel.isPhonePrincipal).length;
  }
}
