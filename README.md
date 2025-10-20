# Split Bill App

A React-based web application for easily splitting bills among friends when dining out or sharing expenses. This app allows users to manage people, menu items, orders, and automatically calculates how much each person owes, including taxes, discounts, and additional costs.

## Features

- **Multiple People Management**: Add and remove people participating in the bill split
- **Menu Management**: Create and manage restaurant menus with items and prices
- **Order Tracking**: Track what each person ordered
- **Cost Distribution**: Automatically calculates how much each person owes
- **Flexible Cost Adjustments**:
  - Shipping/Delivery costs
  - Taxes (with percentage or fixed amount options)
  - Discounts (flat amount)
  - Other additional costs
- **Restaurant Selection**: Manage multiple restaurants and their menus
- **Order History**: Save and load previous orders
- **Data Persistence**: Local storage for offline use and Firebase integration for online synchronization
- **Export/Import**: Export data to JSON files and import from them
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light modes

## Tech Stack

- **Frontend**: React 19 with Vite
- **State Management**: React Hooks
- **Styling**: CSS Modules and custom CSS
- **Build Tool**: Vite
- **Authentication**: Firebase Authentication (Google Sign-In)
- **Database**: Firestore (Firebase)
- **Deployment**: GitHub Pages
- **Icons**: React Feather Icons
- **Utilities**: uuid for unique IDs

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Firebase account (for authentication and data persistence)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Copy your Firebase configuration
   - Create a `.env` file in the project root with the following variables:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the built app locally
- `npm run lint` - Runs ESLint on the project
- `npm run deploy` - Deploys the app to GitHub Pages

## How to Use

1. **Add People**: Enter names of people who will participate in the bill split
2. **Manage Restaurants**: Add restaurants and their menu items with prices
3. **Select Restaurant**: Choose which restaurant's menu to use for orders
4. **Place Orders**: Select a person and add items from the menu to their order
5. **Adjust Costs**: Add shipping, taxes, discounts, or other costs as needed
6. **View Summary**: See the breakdown of what each person owes
7. **Save Orders**: Save orders to history for future reference
8. **Export/Import**: Export data to JSON for backup or import from a previous export

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License.