export type TelephoneCandidatUpdateData = {
  telephone?: string;
  isPhonePrincipal?: boolean;
};

export class TelephoneCandidatDomainService {
  buildUpdateData(input: {
    telephone?: string;
    isPhonePrincipal?: boolean;
  }): TelephoneCandidatUpdateData {
    const data: TelephoneCandidatUpdateData = {};
    if (input.telephone !== undefined) data.telephone = input.telephone;
    if (input.isPhonePrincipal !== undefined)
      data.isPhonePrincipal = input.isPhonePrincipal;
    return data;
  }
}
