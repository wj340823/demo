<template>
    <div></div>
</template>

<script>
    export default {
        name: "Blank",
        created() {
            this.$router.push({
                path: "monitor-info",
                query: { index: "3" }
            })
        }
    };
</script>

<style scoped></style>
