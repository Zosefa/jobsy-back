export type TelephoneRecruteurUpdateData = {
  telephone?: string;
  isPhonePrincipal?: boolean;
};

export class TelephoneRecruteurDomainService {
  buildUpdateData(input: {
    telephone?: string;
    isPhonePrincipal?: boolean;
  }): TelephoneRecruteurUpdateData {
    const data: TelephoneRecruteurUpdateData = {};
    if (input.telephone !== undefined) data.telephone = input.telephone;
    if (input.isPhonePrincipal !== undefined)
      data.isPhonePrincipal = input.isPhonePrincipal;
    return data;
  }
}
