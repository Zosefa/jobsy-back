export type EntrepriseVerificationInput = {
  nom: string;
  ville?: string | null;
  paysId: string;
  siegeSocial?: string | null;
  logo?: string | null;
};

export class EntrepriseDomainService {
  isVerified(input: EntrepriseVerificationInput): boolean {
    return (
      !!input.nom?.trim() &&
      !!input.paysId?.trim() &&
      !!input.ville?.trim() &&
      !!input.siegeSocial?.trim() &&
      !!input.logo?.trim()
    );
  }
}
