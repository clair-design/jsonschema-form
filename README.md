# jsonschema-form

A Vue.js component to generate HTML form from [JSON schema](http://json-schema.org/).

## Usage

```javascript
import JSONSchemaForm from 'jsonschema-form'

const schema = {
  title: 'Login Form',
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string', minLength: 8 }
  }
}

export default {
  data () {
    return { schema }
  },
  components: {
    'schema-form': JSONSchemaForm
  },
  template: `<schema-form :schema="schema" />`
}
```
