import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotesView from '../views/NotesView.vue'
import NoteDetail from '../views/NoteDetail.vue'
import AskView from '../views/AskView.vue'
import QuestionDetail from '../views/QuestionDetail.vue'
import WriteView from '../views/WriteView.vue'
import AskDetail from '../views/AskDetail.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import MyPostsView from '../views/MyPostsView.vue'
import ConfirmView from '../views/ConfirmView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/notes', component: NotesView },
  { path: '/notes/:id', component: NoteDetail },
  { path: '/ask', component: AskView },
  { path: '/questions/:id', component: QuestionDetail },
  { path: '/write', component: WriteView },
  { path: '/ask/:id', component: AskDetail },
  { path: '/login', component: LoginView },
  { path: '/signup', component: SignupView },
  { path: '/my-posts', component: MyPostsView},
  { path: '/confirm', component: ConfirmView},
  { path: '/reset-password', component: ResetPasswordView },
  { path: '/forgot-password', component: ForgotPasswordView },

]

export default createRouter({
  history: createWebHistory(),
  routes,
})
