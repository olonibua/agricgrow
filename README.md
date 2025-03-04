# AgriGrow Finance

## Harvest-Cycle-Aligned Microloans for Nigerian Farmers

AgriGrow Finance is a platform that connects microfinance institutions (MFIs) with smallholder farmers in Nigeria, providing loans that align with harvest cycles and using AI to assess risk.

![AgriGrow Finance](https://placeholder-for-agrigrow-logo.com/logo.png)

## 🌱 Overview

AgriGrow Finance addresses the unique challenges faced by smallholder farmers in Nigeria by:

1. **Aligning loan repayments with harvest cycles** - Ensuring farmers can repay when they have income
2. **Using AI for risk assessment** - Analyzing weather data, crop prices, and farm details for fair evaluations
3. **Providing MFIs with agricultural intelligence** - Helping loan officers make informed decisions
4. **Simplifying the loan application process** - Making financing accessible to farmers

## 🚀 Features

### For Farmers

- **Loan Application Portal**: Simple, accessible interface for applying for agricultural loans
- **Dashboard**: Track application status, loan details, and repayment schedules
- **Crop Calendar**: Access information about optimal planting and harvesting times
- **Market Insights**: View current crop prices and trends

### For Microfinance Institutions

- **Comprehensive Dashboard**: Manage and review loan applications
- **AI-Powered Risk Assessment**: Get intelligent risk scores based on multiple factors
- **Crop Viability Analysis**: Evaluate if the proposed farming project aligns with seasonal patterns
- **Analytics**: Track portfolio performance, crop distribution, and risk profiles
- **Weather Data Integration**: Access current and historical weather data for informed decisions

## 💻 Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Data Visualization**: Recharts
- **Backend Services**: Appwrite (Database, Authentication, Storage)
- **AI/ML**: OpenAI API for risk assessment
- **Data Scraping**: Cheerio for weather data collection
- **Email**: Resend for notifications

## 🛠️ Project Structure

```
app/                  # Next.js app directory
├── api/              # API routes
├── apply/            # Loan application page
├── dashboard/        # Farmer dashboard
├── loans/            # Loan details pages
├── mfi-dashboard/    # MFI dashboard
components/           # React components
├── ui/               # UI components (shadcn)
├── mfi-dashboard/    # MFI dashboard components
lib/                  # Utility functions and shared code
├── data/             # Data fetching functions
├── utils.ts          # Helper functions
functions/            # Serverless functions
├── assess-loan-risk/ # AI risk assessment function
types/                # TypeScript type definitions
public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Appwrite account for backend services
- OpenAI API key for risk assessment

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/agrigrow-finance.git
   cd agrigrow-finance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```
   # Create a .env.local file with the following variables
   APPWRITE_ENDPOINT=your_appwrite_endpoint
   APPWRITE_PROJECT_ID=your_appwrite_project_id
   APPWRITE_API_KEY=your_appwrite_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Models

### Farmer
- Personal information
- Farm details (location, size, crops grown)
- Financial history

### Loan Application
- Amount requested
- Purpose
- Crop type
- Farm size
- Risk assessment data

### Weather Data
- Location
- Rainfall
- Temperature
- Humidity
- Forecast

### Crop Prices
- Crop type
- Current price
- Historical trends

## 🧠 AI Risk Assessment

Our AI risk assessment analyzes:
- Farmer's repayment history
- Crop viability for the region
- Current and forecasted weather conditions
- Market prices and trends
- Farm size to loan amount ratio
- Irrigation availability
- Collateral information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, please contact us at support@agrigrow-finance.com

---

Built with ❤️ for Nigerian farmers
