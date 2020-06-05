export const parseQueryField = (fields?: string) =>{
  if (fields === undefined || fields === "")
    return undefined;
  return fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);
}

export const currentDate = () => {
  /* cspell: disable-next-line */
  const date = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/[\/]/g, "-").replace(",", "").trim()
    .split("-");
  const time = date[2].split(" ");
  return `${time[0]}-${date[0]}-${date[1]} ${time[1]}`;
}

export const allowedFields = (fields: string[]) => {
  const availableSearchFields = [
    "assistance.assistance_id",
    "assistance.assistance_title",
    "assistance.assistance_description",
    "assistance.assistance_available",
    "assistance.assistance_total_vacancies",
    "assistance.assistance_available_vacancies",
    "assistance.assistance_date",
    "assistanceCourse.course_name",
    "assistanceCourse.course_description",
    "assistanceCourse.course_id",
    "subject.subject_id",
    "subject.subject_name",
    "subject.subject_description",
    "assistant.user_id",
    "assistant.user_full_name",
    "assistant.user_created_at",
    "assistant.user_assistant_stars",
    "assistant.user_email",
    "assistant.user_course_id",
    "assistantCourse.course_id",
    "assistantCourse.course_name",
    "assistantCourse.course_description",
    "address.address_cep",
    "address.address_street",
    "address.address_number",
    "address.address_complement",
    "address.address_reference",
    "address.address_nickname",
    "address.address_latitude",
    "address.address_longitude",
    "address.address_assistance_id",
  ];

  for (const field of fields) {
    let verifier = false;
    for (const allowed of availableSearchFields)
      verifier = verifier || (allowed === field);
    if (verifier === false)
      return false;
  }
  return true;
}

export const notAllowedFieldsSearch = (fields?: string[]) => {
  if (fields === undefined)
    return true;
  const notAllowedFields = [
    "user_id",
    "user_created_at",
    /* cspell: disable-next-line */
    "user_matricula",
    /* cspell: disable-next-line */
    "user_idUFFS",
    "user_email",
    "user_phone_number",
    "user_password",
    "user_cpf"
  ];
  for (const field of fields) {
    for (const notAllowed of notAllowedFields) {
      if (field === notAllowed || `user.${notAllowed}` === notAllowed)
        return true;
    }
  }
  return false;
}