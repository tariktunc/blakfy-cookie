// Conventional Commits — https://www.conventionalcommits.org/
// Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0], // Türkçe karakterler için kapatıldı
    "header-max-length": [2, "always", 120], // CLAUDE.md HEREDOC commit'leri için 100'den 120'ye
    "body-max-line-length": [0], // Co-Authored-By satırı uzun olabilir
    "footer-max-line-length": [0],
  },
};
