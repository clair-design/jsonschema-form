/**
 * a fake image uploader
 */
Vue.prototype.$clair.uploadFunction = function (files) {
  return Promise.resolve(URL.createObjectURL(files[0]))
}

const options = [
  { value: 'simple', label: 'Simple Schema' },
  { value: 'type', label: 'Types & Formats' },
  { value: 'validation', label: 'Validation' },
  { value: 'nested', label: 'Nested' },
  { value: 'array', label: 'Array' }
]

const app = new Vue({
  data () {
    return {
      schema: {},
      schemaName: options[4].value,
      formProps: {
        labelWidth: '6em',
        width: 'flexible'
      },
      options,
      value: {}
    }
  },
  watch: {
    schemaName: {
      immediate: true,
      handler: function (name) {
        fetch(`schema/${name}.json`)
          .then(res => res.json())
          .then(schema => this.schema = schema)
      }
    }
  },
  components: {
    'schema-form': JSONSchemaForm
  },
  methods: {
  }
}).$mount('#app')

