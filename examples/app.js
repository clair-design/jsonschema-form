Vue.prototype.$clair.uploadFunction = function (files) {
  console.log(files)
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', files[0])
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://inn.qiwoo.org/api/uploadfile');
    xhr.onload = function () {
      if (xhr.status == 200) {
        const data = JSON.parse(xhr.responseText)
        if (data.error) return reject(data.error)
        return resolve(data.url)
      } else {
        reject(xhr.status)
      }
    }
    xhr.send(formData);
  })
}

const previewFrame = document.querySelector('iframe')

function initApp (schema) {
  const value = schema.examples ? schema.examples[0] : {}
  const app = new Vue({
    data () {
      return {
        schema,
        formProps: {
          labelWidth: '6em',
          width: 'longer'
        },
        value
      }
    },
    components: {
      'schema-form': JSONSchemaForm
    },
    methods: {
      onInput () {
        previewFrame.contentWindow.postMessage(this.value, '*')
      }
    }
  }).$mount('#app')
}

window.onmessage = function (e) {
  if (e.origin !== location.origin) return
  if (e.data.$schema) {
    initApp(e.data)
  }
}

