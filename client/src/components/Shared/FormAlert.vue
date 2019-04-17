<template>
  <v-alert
    type="error"
    icon="error"
    transition="scale-transition"
    :value="true"
    dismissible
  >
    <h3>{{ message }}</h3>
  </v-alert>
</template>

<script>
export default {
  name: 'FormAlert',
  props: ['message']
};
</script>

<style lang="scss" scoped></style>
