<script>
    function toggle() {
        window.document.body.classListlist.toggle("dark-mode")
    }
</script>
<button on:click={toggle}>
    <slot/>
</button>
<style>
    button {
        background-color:  rgb(15, 74, 101);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem;
    }
    :global(body.dark-mode) button {
        background-color: rgb(15, 74, 101);
        color: white;
    }
</style>