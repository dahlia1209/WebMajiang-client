<script setup lang="ts">
const request = async (url: string, method: string = "GET") => {
    try {
        const response = await fetch(url, {
            method,
        });
        const responseData = await response.json();
        if (!response.ok) {
        const error = new Error('HTTP Error') ;
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
        if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
}
</script>

<template>
    <button @click="request('http://127.0.0.1:8000/users/me')">request</button>
</template>