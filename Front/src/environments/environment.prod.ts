// Em produção o site e a API ficam no mesmo endereço: o nginx do front repassa
// /api e /uploads para o container da API (ver Front/nginx.conf).
export const environment = {
  production: true,
  arquivosUrl: '',
  apiUrl: '/api'
};
