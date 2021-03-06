/* tslint:disable */


/**
 * AUTO-GENERATED FILE @ 2020-06-06 16:38:21 - DO NOT EDIT!
 *
 * This file was automatically generated by schemats v.3.0.3
 * $ schemats generate -c mysql://username:password@localhost/myDB -t address -t assistance -t assistance_presence_list -t assistance_tag -t course -t subject -t subject_course -t tag -t user -s myDB
 *
 */


export namespace addressFields {
    export type id = number | string;
    export type cep = string;
    export type street = string;
    export type number_ = number;
    export type complement = string | null;
    export type reference = string | null;
    export type nickname = string | null;
    export type latitude = number | null;
    export type longitude = number | null;
    export type assistance_id = number | string;

}

export interface address {
    id: addressFields.id;
    cep: addressFields.cep;
    street: addressFields.street;
    number: addressFields.number_;
    complement: addressFields.complement;
    reference: addressFields.reference;
    nickname: addressFields.nickname;
    latitude: addressFields.latitude;
    longitude: addressFields.longitude;
    assistance_id: addressFields.assistance_id;

}

export namespace assistanceFields {
    export type id = number | string;
    export type owner_id = number | string;
    export type title = string;
    export type total_vacancies = number;
    export type available = boolean;
    export type available_vacancies = number;
    export type description = string;
    export type date = Date | string;
    export type created_at = Date | string;
    export type course_id = number | string | null;
    export type subject_id = number | string| null;
    export type suspended_date = Date | null;
}

export interface assistance {
    id: assistanceFields.id;
    owner_id: assistanceFields.owner_id;
    title: assistanceFields.title;
    total_vacancies: assistanceFields.total_vacancies;
    available: assistanceFields.available;
    available_vacancies: assistanceFields.available_vacancies;
    description: assistanceFields.description;
    date: assistanceFields.date;
    created_at?: assistanceFields.created_at;
    course_id?: assistanceFields.course_id;
    subject_id?: assistanceFields.subject_id;
    suspended_date?: assistanceFields.suspended_date;

}

export namespace assistance_presence_listFields {
    export type id = number | string;
    export type student_id = number | string;
    export type assistance_id = number | string;
    export type assistant_rating = number | null;
    export type student_rating = number | null;
    export type student_presence = boolean;

}

export interface assistance_presence_list {
    id: assistance_presence_listFields.id;
    student_id: assistance_presence_listFields.student_id;
    assistance_id: assistance_presence_listFields.assistance_id;
    assistant_rating: assistance_presence_listFields.assistant_rating;
    student_rating: assistance_presence_listFields.student_rating;
    student_presence: assistance_presence_listFields.student_presence;

}

export namespace assistance_tagFields {
    export type id = number | string;
    export type assistance_id = number | string;
    export type tag_id = number | string;
    export type created_at = Date;

}

export interface assistance_tag {
    id: assistance_tagFields.id;
    assistance_id: assistance_tagFields.assistance_id;
    tag_id: assistance_tagFields.tag_id;
    created_at: assistance_tagFields.created_at;

}

export namespace courseFields {
    export type id = number | string;
    export type name = string;
    export type number_semesters = number | null;
    export type description = string | null;

}

export interface course {
    id: courseFields.id;
    name: courseFields.name;
    number_semesters: courseFields.number_semesters;
    description: courseFields.description;

}

export namespace subjectFields {
    export type id = number | string;
    export type name = string;
    export type description = string | null;
    export type code = string | null;

}

export interface subject {
    id: subjectFields.id;
    name: subjectFields.name;
    description: subjectFields.description;
    code: subjectFields.code;

}

export namespace subject_courseFields {
    export type id = number | string;
    export type course_id = number | string;
    export type subject_id = number | string;
    export type semester = number | null;

}

export interface subject_course {
    id: subject_courseFields.id;
    course_id: subject_courseFields.course_id;
    subject_id: subject_courseFields.subject_id;
    semester: subject_courseFields.semester;

}

export namespace tagFields {
    export type id = number | string;
    export type name = string;
    export type description = string | null;
    export type created_at = Date;

}

export interface tag {
    id: tagFields.id;
    name: tagFields.name;
    description: tagFields.description;
    created_at: tagFields.created_at;

}

export namespace userFields {
    export type id = number | string;
    export type full_name = string;
    export type created_at = Date;
    export type is_assistant = boolean;
    export type course_id = number | string | null;
    export type cpf = string | null;
    export type matricula = string | null;
    export type idUFFS = string | null;
    export type assistant_stars = number;
    export type student_stars = number;
    export type email = string | null;
    export type phone_number = string | null;
    export type password = string;
    export type verified_assistant = boolean;
    export type profile_picture = string | null;

}

export interface user {
    id: userFields.id;
    full_name: userFields.full_name;
    created_at: userFields.created_at;
    is_assistant: userFields.is_assistant;
    course_id: userFields.course_id;
    cpf: userFields.cpf;
    matricula: userFields.matricula;
    idUFFS: userFields.idUFFS;
    assistant_stars: userFields.assistant_stars;
    student_stars: userFields.student_stars;
    email: userFields.email;
    phone_number: userFields.phone_number;
    password: userFields.password;
    verified_assistant: userFields.verified_assistant;
    profile_picture: userFields.profile_picture;

}
