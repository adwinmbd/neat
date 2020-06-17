<template>
  <Layout>
    <div class="container">
      <h1>List posts</h1>
      <div v-for="post in $page.posts.edges" :key="post.id" class="post d-flex">
        <div>
          <div class="post__img" :style="{ 'background-image': 'url(' + post.node.image + ')' }"></div>
        </div>
        <div class="post__body">
          <g-link :to="post.node.path" class="post__link"></g-link>
          <h1 class="post__title">{{post.node.title}}</h1>
          <p class="post__abstract">{{post.node.abstract}}</p>
        </div>
      </div>
    </div>
  </Layout>
</template>
<page-query>
query {
  posts: allPost {
    edges {
      node {
        title
        abstract
        image
        path
      }
    }
  }
}
</page-query>
<script>
export default {
  metaInfo: {
    title: "My blog"
  }
};
</script>
<style>
.post {
  display: flex;
  align-items: center;
  box-shadow: 5px 5px 11px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  position: relative;
  margin-top: 50px;
  background-color: #fff;
}
@media screen and (max-width: 992px) {
  .post {
    display: block;
  }
}
.post__title {
  margin-top: 0;
}
.post__body {
  padding: 15px 30px;
}
.post__link {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
.post__img {
  width: 250px;
  height: 140px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-right: 15px;
}
@media screen and (max-width: 992px) {
  .post__img {
    width: 100%;
    height: 180px;
  }
}
</style>
