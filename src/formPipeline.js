const Q = require('q')

class FormPipeline {
  constructor({ steps, formReader }) {
    this.steps = steps 
    this.formReader = formReader
  }
  addMissingFields() {
    this.steps = this.steps.map(step => {
      const { 
        formAt = 0, 
        willSubmit = _ => {}, 
        willSendRequest = (response) => this.formReader.extendOptions,
        nextURL = response => response.headers.location 
      } = step
      return { 
        formAt, 
        willSubmit, 
        nextURL,
        willSendRequest,
      }
    })
  }
  async startWith(url) {
    this.addMissingFields()
    let goURL = url
    let response = null
    for (let i = 0; i < this.steps.length; i++) {
      const { formAt, willSubmit, nextURL, willSendRequest } = this.steps[i]
      if (!goURL) throw new Error(`There is not URL`)
      response = await this
        .formReader
        .willSendRequest(willSendRequest(response))
        .readFrom(goURL)
        .formAt(formAt)
        .willSubmit(willSubmit)
        .submit()
      goURL = nextURL(response)
    }
    return response
  }
}

module.exports = FormPipeline
