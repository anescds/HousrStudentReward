import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userid || !password) {
      toast.error("Please enter both userid and password");
      return;
    }

    try {
      setLoading(true);
      const response = await login({ userid, password });
      
      if (response.success) {
        toast.success(`Welcome, ${response.user.name}!`);
        // Redirect to home page after successful login
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="brutal-card w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black uppercase mb-2">LOGIN</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase">
              Rent Rewards
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userid" className="font-black uppercase text-sm">
                User ID
              </Label>
              <Input
                id="userid"
                type="text"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                placeholder="Enter your user ID"
                className="brutal"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-black uppercase text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="brutal"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full brutal font-black uppercase"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-accent/50 border-4 border-black dark:border-white">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Demo Credentials:
            </p>
            <p className="text-xs font-black mt-2">
              User ID: <span className="font-mono">user</span>
            </p>
            <p className="text-xs font-black">
              Password: <span className="font-mono">password</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

