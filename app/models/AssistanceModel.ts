import { db } from "../helpers/dbHelper";

interface FilterOptions {
  filter?: string,
  limit?: number,
  offset?: number,
  filterData?: string,
  orderBy?: string,
  orderByData?: string,
  avaliable?: boolean
};

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

  static async getAll(limit: number, offset: number, avaliable: boolean): Promise<object[]> {
    this.defaultSearch().
      orderBy("assistance_id", "DESC");

    if (avaliable !== undefined) {
      if (Boolean(avaliable) === true)
        db.where("assistance_avaliable", String(1));
    }

    if (limit !== undefined && offset !== undefined)
      db.pagination(limit, offset);


    try {
      const rowsAndInfos = await db.resolve();
      return this.parseDefaultData(rowsAndInfos);
    }
    catch (err) {
      throw err;
    }
  }

  /**
   * @static
   * @param {*} idAssistance
   * @returns {assistance} returns an assistance
   */
  static async searchByID(id: number): Promise<DefaultResponse> {

    this.defaultSearch().where("assistance_id", String(id));

    try {
      const assistance = await db.resolve();
      const parsedData = this.parseDefaultData(assistance);

      return parsedData[0];
    }
    catch (err) {
      throw err;
    }
  };

  static async searchByName(name: string, args: FilterOptions = null): Promise<DefaultResponse[]> {
    // TODO: protec from sql injection
    this.defaultSearch().
      where("assistance_title").
      like(`%${name}%`);

    defaultFilters(args);

    try {
      const assistance = await db.resolve();
      const parsedData = this.parseDefaultData(assistance);

      return parsedData;
    }
    catch (err) {
      throw err;
    }
  };

  static async searchByTag(name: string, args: FilterOptions = null): Promise<DefaultResponse[]> {
    // TODO: protec from sql injection
    this.defaultSearch().
      leftJoin("assistance_tag as at at.assistance_id", "a.assistance_id").
      leftJoin("tag.tag_id", "at.tag_id").
      where("tag.tag_name").
      like(`%${name}%`);

    defaultFilters(args);

    try {
      const assistance = await db.resolve();
      const parsedData = this.parseDefaultData(assistance);

      return parsedData;
    }
    catch (err) {
      throw err;
    }
  };

  static async searchByNameTagDescription(name: string, args: FilterOptions = null): Promise<DefaultResponse[]> {
    // TODO: protec from sql injection
    this.defaultSearch().
      leftJoin("assistance_tag as at at.assistance_id", "a.assistance_id").
      leftJoin("tag.tag_id", "at.tag_id").
      where("(tag.tag_name").
      like(`%${name}%`).
      or("a.assistance_title").like(`%${name}%`).
      or("a.assistance_description").like(`%${name}%`, ')');

    defaultFilters(args);

    try {
      const assistance = await db.resolve();
      const parsedData = this.parseDefaultData(assistance);

      return parsedData;
    }
    catch (err) {
      throw err;
    }
  };


  private static parseDefaultData(data: any): DefaultResponse[] {
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
  private static defaultSearch() {
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
      join("a.assistance_subject_id", "subject as sub sub.subject_id");

    return db;
  }

};

function defaultFilters(args: FilterOptions) {
  if (args.limit !== undefined && args.offset !== undefined)
    db.pagination(args.limit, args.offset);
  if (args.filter !== undefined) {
    if (args.filter.search("course") >= 0) {
      const field = args.filter.split("-")[1];
      const query = `assc.course_${field}`;
      db.and(query, args.filterData);
    }
  }

  if (args.avaliable !== undefined) {
    if(Boolean(args.avaliable) === true)
      db.and("assistance_avaliable", String(1));
  }

  if (args.orderBy !== undefined) {
    const sortOrder = args.orderByData === undefined ? "ASC" : args.orderByData;
    db.orderBy(`a.assistance_${args.orderBy}`, sortOrder);
  }
}


interface DefaultResponse {
  assistance: {
    id: number,
    title: string,
    description: string,
    avaliable: boolean,
    total_vacancies: number,
    avalible_vacancies: number,
    date: Date,
    subjectName: string,
    course: {
      id: number,
      name: string,
      description: string,
    },
    owner: {
      id: number,
      fullName: string,
      createdAt: Date,
      stars: number,
      email: string,
      verifiedAssistant: boolean,
      course: {
        id: number,
        name: string,
        description: string,
      },
    },
    address: {
      id: number,
      cep: string,
      street: string,
      number: number,
      complement: string,
      reference: string,
      nickname: string,
      latitude: string,
      logintude: string,
    }
  }
}