import { Title } from "@solidjs/meta";

export default function About() {
  return (
    <>
      <Title>About - NOAA Fisheries</Title>
      <div class="about-page">
        <header class="about-header">
          <h1>About NOAA Fisheries</h1>
          <p>Learn more about our mission to protect marine resources</p>
        </header>

        <div class="about-content">
          <section class="about-section">
            <h2>Our Mission</h2>
            <p>
              NOAA Fisheries is responsible for the stewardship of the nation's
              ocean resources and their habitat. We provide vital services for
              the nation: productive and sustainable fisheries, safe sources of
              seafood, the recovery and conservation of protected resources, and
              healthy ecosystems—all backed by sound science and an
              ecosystem-based approach to management.
            </p>
          </section>

          <section class="about-section">
            <h2>Regional Management</h2>
            <p>
              Our work is organized by regions to better serve local communities
              and ecosystems. Each region has unique challenges and
              opportunities, from the cold waters of Alaska to the tropical
              Pacific Islands. This regional approach allows us to tailor our
              conservation and management strategies to local conditions.
            </p>
          </section>

          <section class="about-section">
            <h2>Nutritional Data</h2>
            <p>
              This application provides access to nutritional information for
              fish species across different NOAA regions. The data helps
              consumers make informed choices about seafood while supporting
              sustainable fishing practices and healthy eating habits.
            </p>
          </section>
        </div>

        <style jsx>{`
          .about-page {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }

          .about-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .about-header h1 {
            font-size: 2.5rem;
            color: #1976d2;
            margin-bottom: 1rem;
          }

          .about-header p {
            font-size: 1.2rem;
            color: #666;
          }

          .about-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .about-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .about-section h2 {
            color: #1976d2;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          .about-section p {
            line-height: 1.6;
            color: #333;
            font-size: 1rem;
          }

          @media (max-width: 768px) {
            .about-page {
              padding: 1rem;
            }

            .about-header h1 {
              font-size: 2rem;
            }

            .about-header p {
              font-size: 1rem;
            }

            .about-section {
              padding: 1.5rem;
            }

            .about-section h2 {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 480px) {
            .about-header h1 {
              font-size: 1.5rem;
            }

            .about-section {
              padding: 1rem;
            }

            .about-section h2 {
              font-size: 1.2rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
