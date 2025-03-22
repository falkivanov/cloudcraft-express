
import { Container } from "@/components/ui/container";

const Index = () => {
  return (
    <Container className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="text-center p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">Willkommen bei FinSuite</h1>
        <p className="text-xl text-muted-foreground">
          Ihr Logistik- und Verwaltungssystem für effiziente Betriebsabläufe
        </p>
      </div>
    </Container>
  );
};

export default Index;
