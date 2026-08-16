// ════════════════════════════════════════════════════════════════
//  GEO · Trips — Central content / copy file
//  Edit every visible string of the app from here.
// ════════════════════════════════════════════════════════════════

export const brand = {
  name: "GEO",
  separator: "·",
  suffix: "Trips",
  icon: "earth-americas",
}

export const navbar = {
  bookTrip: "Book a Trip",
  login: "Login",
  signup: "Sign up",
  logout: "Logout",
}

export const landing = {
  hero: {
    badge: "GEO · Trips",
    titleLead: "Plan your trips with",
    titleHighlight: "total clarity",
    subtitle:
      "Stop guessing what a trip includes. Explore every stop on a live map, compare agencies openly, and book with confidence — no scattered DMs, no surprises.",
    primaryCta: "Explore Map",
    secondaryCta: "Browse Trips",
  },
  problems: {
    eyebrow: "The problem today",
    title: "Travel planning is broken",
    items: [
      {
        icon: "satellite-dish",
        title: "Scattered everywhere",
        text: "Trips are posted across TikTok, Facebook and Instagram — fragmented, hard to follow, and easy to miss.",
      },
      {
        icon: "compass",
        title: "Mystery routes",
        text: "Only pencil sketches and photos. No clear map, no idea which stop is a beach, camp, restaurant or rest.",
      },
      {
        icon: "money-bill-wave",
        title: "Hidden costs",
        text: "You never know what the price covers — food, lodging, paid attractions — until you ask, then wait for a reply.",
      },
      {
        icon: "hourglass-half",
        title: "Slow booking",
        text: "DM the page, chase answers, hope for a spot. No fair, instant way to compare and reserve.",
      },
    ],
  },
  solutions: {
    eyebrow: "Our solution",
    title: "One platform, full transparency",
    items: [
      {
        icon: "map-location-dot",
        title: "Interactive trip map",
        text: "Every tour drawn on a live map — see the full path from start to finish before you decide.",
      },
      {
        icon: "map-pin",
        title: "Know each stop",
        text: "Each waypoint is typed and icon-tagged: restaurant, camp, beach, rest, attraction, forest, stop.",
      },
      {
        icon: "receipt",
        title: "Clear coverage",
        text: "Exactly what the agency pays for — meals, lodging, pools, transport — vs. what you cover yourself.",
      },
      {
        icon: "scale-balanced",
        title: "Compare & book",
        text: "Compare trips by distance, hours or services, then reserve your seat in a few clicks.",
      },
      {
        icon: "star",
        title: "Honest reviews",
        text: "Travelers who joined rate and comment freely after the trip — real proof, not promises.",
      },
      {
        icon: "shield-halved",
        title: "Agency trust",
        text: "Verified agencies show total trips, travelers served and overall rating at a glance.",
      },
    ],
  },
  waypoints: {
    eyebrow: "Waypoint types",
    title: "Every stop, visual at a glance",
  },
  cta: {
    title: "Ready to see where you'll go?",
    subtitle: "Open the interactive map and browse every published trip — stop by stop.",
    button: "Explore the Map",
  },
  footer: "GEO · Trips — transparent travel planning.",
}

export const sidePanel = {
  eyebrow: "Explore Trips",
  title: "Plan your route",
  subtitle: "Trusted agencies. Clear stops. Compare before you book.",
  searchPlaceholder: "Search trips...",
  sortLabel: "Sort",
  sortPrice: "Price",
  sortDistance: "Km",
  verifiedChip: (count) => `${count} verified published trips`,
  noResults: "No trips match your search.",
}

export const home = {
  previewPrefix: "Previewing",
  backToMap: "Back to map",
}

export const tripsList = {
  title: "Trips",
  managedBy: (name) => `Managed by ${name}`,
  createButton: "+ Create New Tour",
  loading: "Loading tours...",
  empty: "No tours yet. Create your first one.",
  published: "Published",
  draft: "Draft",
  price: (price) => `${price} $`,
  pricePerPerson: "per person",
  distance: (km) => `${km} km`,
  seats: (seats) => `${seats}`,
  viewTrip: "View Trip",
  edit: "Edit",
  draw: "Draw On Map",
  publish: "Publish",
  unpublish: "Unpublish",
  delete: "Delete",
  deleteConfirm: "Are you sure you want to delete this trip?",
  noDescription: "No description.",
}

export const tripForm = {
  createTitle: "Create Tour",
  editTitle: "Edit Tour",
  titleLabel: "Title",
  titlePlaceholder: "e.g. Coastal Adventure",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Describe the trip program...",
  priceLabel: "Price (per person)",
  seatsLabel: "Seats",
  includedLabel: "Included Services",
  notIncludedLabel: "Not Included Services",
  save: "Save",
  saved: "Saved",
  savedMessage: "Tour saved.",
  titleRequired: "Please provide a title before saving.",
}

export const tripDraw = {
  editorTitle: "Trip Map Editor",
  startLabel: "Start Point",
  endLabel: "End Point",
  startAdd: "Add start point",
  startChange: "Change start point",
  startClick: "Click on the map...",
  endAdd: "Add end point",
  endChange: "Change end point",
  endClick: "Click on the map...",
  save: "Save",
  saved: "Saved",
  savedMessage: "Route saved.",
  back: "Back to Trips",
}

export const auth = {
  title: "GEO · Trips",
  resetTitle: "Reset Password",
  loginSubtitle: "Welcome back, traveler!",
  registerSubtitle: "Join as an agency or a traveler.",
  forgotSubtitle: "Securely reset your password.",
  signIn: "Sign In",
  createAccount: "Create Account",
  loginNow: "Login Now",
  createAccountBtn: "Create Account",
  resetPassword: "Reset Password",
  sendResetCode: "Send Reset Code",
  forgotPassword: "Forgot Password?",
  backToLogin: "Back to Login",
  backToHome: "Back to home",
  labels: {
    fullName: "Full name",
    fullNamePlaceholder: "Amina Benali",
    email: "Email Address",
    emailPlaceholder: "you@example.com",
    phone: "Phone",
    phonePlaceholder: "+213 ...",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm Password",
    resetCode: "Reset Code",
    resetCodePlaceholder: "6-digit code",
    newPassword: "New Password",
  },
  showPassword: "Show password",
  hidePassword: "Hide password",
  loginSuccess: "Login successful! Redirecting...",
  accountCreated: "Account created! Please sign in.",
  passwordReset: "Password reset! Please sign in.",
  emailFirst: "Please enter your email first.",
  passwordTooShort: "Password must be at least 6 characters.",
  passwordsMismatch: "Passwords do not match.",
  resetCodeDev: (code) => `Reset code sent (dev): ${code}`,
}

export const notFound = {
  code: "404",
  title: "Page Not Found",
  text: "The page you're looking for doesn't exist.",
  button: "Back to Home",
}

export const errorBoundary = {
  title: "Something went wrong",
  reload: "Reload",
}
