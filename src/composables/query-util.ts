import { fields, type Query, type SavedQuery } from '../model/query'

export const useQueryUtil = () => {
  return {
    queryString(query: SavedQuery): string {
      let str = ''
      if (query.criteria.length) {
        str +=
          '?' +
          query.criteria
            .map((c) => {
              let p = `${c.name}=`
              if (c.operator !== '=') {
                p += c.operator
              }
              return p + c.value
            })
            .join('&')
      }
      return str
    },
    fromSavedQuery(savedQuery: SavedQuery): Query {
      return {
        name: savedQuery.name,
        criteria: savedQuery.criteria.reduce(
          (crit, criterion) => {
            crit[criterion.name] = {
              field: fields.find((f) => f.name === criterion.name)!,
              operator: criterion.operator,
              value: criterion.value
            }
            return crit
          },
          {} as Query['criteria']
        )
      }
    },
    toSavedQuery(query: Query): SavedQuery {
      return {
        name: query.name,
        criteria: Object.keys(query.criteria).map((key) => {
          const criterion = query.criteria[key]
          return {
            name: criterion.field.name,
            operator: criterion.operator,
            value: criterion.value
          }
        })
      }
    },
    getUserQuery(): string | null {
      return localStorage.getItem('mythme.query')
    },
    saveUserQuery(queryName: string) {
      localStorage.setItem('mythme.query', queryName)
    },
    deleteUserQuery() {
      localStorage.removeItem('mythme.query')
    },
    findUserQuery(queries: SavedQuery[]): SavedQuery | undefined {
      const q = this.getUserQuery()
      if (q) {
        return queries.find((query) => query.name === q)
      }
    }
  }
}
