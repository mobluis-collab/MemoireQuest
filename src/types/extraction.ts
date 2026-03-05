export interface ExtractionResult {
  type_memoire: string
  niveau: string | null
  discipline: string | null
  etablissement: string | null
  deadline: string | null
  nombre_pages: string | null
  structure_imposee: string | null
  competences_a_valider: string[]
  contraintes_formelles: string | null
  sujet_ou_theme: string | null
  resume_contenu: string
}
