export type PhoneInput = { telephone: string; isPhonePrincipal?: boolean };

export type CandidatProfilInput = {
  nom: string;
  prenom: string;
  photo?: string;
  paysId: string;
  ville?: string;
  adresse?: string;
  resume?: string;
  anneesExperience?: number;
};

export type RecruteurProfilInput = {
  nom: string;
  prenom: string;
  fonction?: string;
  photo?: string;
  entrepriseId: string;
};

export class AuthDomainService {
  countPrimaryPhones(telephones?: PhoneInput[]) {
    if (!telephones || telephones.length === 0) return 0;
    return telephones.filter((t) => t.isPhonePrincipal).length;
  }

  isCandidatProfilComplete(input: CandidatProfilInput) {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.paysId?.trim() &&
      !!input.ville?.trim() &&
      !!input.adresse?.trim() &&
      !!input.resume?.trim() &&
      input.anneesExperience !== undefined
    );
  }

  isRecruteurProfilComplete(input: RecruteurProfilInput) {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.fonction?.trim() &&
      !!input.entrepriseId?.trim()
    );
  }
}
