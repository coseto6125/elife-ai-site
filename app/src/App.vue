<script setup lang="ts">
import SiteNav from './components/SiteNav.vue'
import HeroSection from './components/HeroSection.vue'
import ServicesSection from './components/ServicesSection.vue'
import WorkSection from './components/WorkSection.vue'
import ShowcaseSection from './components/ShowcaseSection.vue'
import AboutSection from './components/AboutSection.vue'
import PricingSection from './components/PricingSection.vue'
import ContactSection from './components/ContactSection.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <SiteNav />
  <main>
    <HeroSection />
    <ServicesSection />
    <WorkSection />
    <ShowcaseSection />
    <AboutSection />
    <PricingSection />
    <ContactSection />
  </main>
  <SiteFooter />
</template>
