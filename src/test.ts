import { edenFetch } from '@elysiajs/eden'
import type { App } from '.'

const fetch = edenFetch<App>('http://localhost:3000')

const { data } = await fetch('/item/:id', {
  method: 'GET',
  params: {
    id: 0
  },
})

if (data) {
  switch (data.type) {
    case 'story': {
      console.log(data.type);
    }
  }
}
