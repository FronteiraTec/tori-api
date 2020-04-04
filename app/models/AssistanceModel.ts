/* eslint-disable require-jsdoc */

import {db} from "../helpers/dbHelper";

export default class AssistanceModel {
  assistanceId: number;
  assistanceOwnerId: number;
  assistanceTitle: string;
  assistanceTotalVacancies: number;
  assistanceAvaliableVacancies: number;
  assistandeAvaliable: boolean;
  assistanceLocalId: number;
  assistanceDescription: string;
  assistanceDate: string;
  assisstanceCreateAt: string;
  assistanceCourseId: number;
  assistanceSubjectId: number;

  /**
   * @static
   * @returns {[assistances]} List of all assistances
   */

  static async getAll(limit: number, offset: number, avaliable: boolean) {
    db.select(`
      a.*,
      u.user_id,
      u.user_full_name,
      u.user_created_at,
      u.user_assistant_stars,
      u.user_email,
      u.user_verified_assistant,
      u.user_course_id,
      assc.course_name,
      assc.course_description,
      assc.course_id,
      ad.address_id,
      ad.address_cep,
      ad.address_street,
      ad.address_number,
      ad.address_complement,
      ad.address_reference,
      ad.address_nickname,
      ad.address_latitude,
      ad.address_logintude,
      owc.course_id,
      owc.course_name,
      owc.course_description,
      sub.subject_id,
      sub.subject_name,
      sub.subject_description
    `).
    from("assistance as a").
      orderBy("assistance_id", "DESC");

    if (avaliable !== undefined) {
      db.where("assistance_avaliable", String(avaliable));
    }

    if (limit !== undefined && offset !== undefined)
      db.pagination(limit, offset);

    db.
      join("a.assistance_owner_id", "user as u u.user_id").
      join("a.assistance_course_id", "course as assc assc.course_id").
      join("a.assistance_local_id", "address as ad ad.address_id").
      join("u.user_course_id", "course as owc owc.course_id").
      join("a.assistance_subject_id", "subject as sub sub.subject_id");


    try{
      const rowsAndInfos = await db.resolve();
      // const assistances = [...rowsAndInfos];
      return this.parseDataGetAll(rowsAndInfos);

      // return assistances;
    }
    catch(err) {
      throw err;
    }
  }

  static parseDataGetAll(data: any): object[]{
    return data.map((value: any) => {
      return {
        assistance: {
          id: value.a.assistance_id,
          title: value.a.assistance_title,
          description: value.a.assistance_description,
          avaliable: value.a.assistance_avaliable,
          total_vacancies: value.a.assistance_total_vacancies,
          avalible_vacancies: value.a.assistance_avalible_vacancies,
          date: value.a.assistance_date,
          subjectName: value.a.assistance_subjectName,
          course: {
            id: value.assc.course_id,
            name: value.assc.course_name,
            description: value.assc.course_description,
          },
          owner: {
            id: value.u.user_id,
            fullName: value.u.user_full_name,
            createdAt: value.u.user_created_at,
            stars: value.u.user_assistant_stars,
            email: value.u.user_assistant_email,
            verifiedAssistant: value.u.user_verified_assistant,
            course: {
              id: value.owc.course_id,
              name: value.owc.course_name,
              description: value.owc.course_description,
            },
          },
          address: {
            id: value.ad.address_id,
            cep: value.ad.address_cep,
            street: value.ad.address_street,
            number: value.ad.address_number,
            complement: value.ad.address_complement,
            reference: value.ad.address_reference,
            nickname: value.ad.address_nickname,
            latitude: value.ad.address_latitude,
            logintude: value.ad.address_logintude,
          },
        }
      }
    });
  }
  /**
   * @static
   * @param {*} idAssistance
   * @returns {assistance} returns an assistance
   */
  static async getByID(id: number) {
      db.
      from("assistance as a").
      select(`
      a.*,
      u.user_id,
      u.user_full_name,
      u.user_created_at,
      u.user_assistant_stars,
      u.user_email,
      u.user_verified_assistant,
      u.user_course_id,
      assc.course_name,
      assc.course_description,
      assc.course_id,
      ad.address_id,
      ad.address_cep,
      ad.address_street,
      ad.address_number,
      ad.address_complement,
      ad.address_reference,
      ad.address_nickname,
      ad.address_latitude,
      ad.address_logintude,
      owc.course_id,
      owc.course_name,
      owc.course_description,
      sub.subject_id,
      sub.subject_name,
      sub.subject_description
    `).
    join("a.assistance_owner_id", "user as u u.user_id").
      join("a.assistance_course_id", "course as assc assc.course_id").
      join("a.assistance_local_id", "address as ad ad.address_id").
      join("u.user_course_id", "course as owc owc.course_id").
      join("a.assistance_subject_id", "subject as sub sub.subject_id").
      where("assistance_id", String(id));

      try{
        const assistance = await db.resolve();
        const parsedData = this.parseDataGetAll(assistance);

        return parsedData[0];
      }
      catch(err) {
        throw err;
      }
  };

};
