'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { completeOnboarding } from '@/lib/actions/auth'
import { PROFESSIONAL_CATEGORIES, BRAZILIAN_STATES } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, name: 'Informações Básicas' },
  { id: 2, name: 'Localização' },
  { id: 3, name: 'Finalizar' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: '',
    category: '',
    phone: '',
    city: '',
    state: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.displayName.trim() !== '' && formData.category !== ''
    }
    return true
  }

  async function handleSubmit() {
    setIsLoading(true)

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value)
    })

    const result = await completeOnboarding(form)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    if (result.redirect) {
      toast.success('Perfil criado com sucesso!')
      router.push(result.redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BeautyBook</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Passo {currentStep} de {steps.length}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center text-sm font-medium',
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="size-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      'ml-3 text-sm hidden sm:block',
                      currentStep >= step.id
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-24 h-0.5 mx-4',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Conte-nos sobre você</h1>
                <p className="mt-2 text-muted-foreground">
                  Essas informações aparecerão na sua página pública
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome do seu negócio ou nome profissional</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => updateField('displayName', e.target.value)}
                    placeholder="Ex: Studio Maria, Barbearia Silva..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Esse nome aparecerá na sua página de agendamento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Sua especialidade</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROFESSIONAL_CATEGORIES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.icon} {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp (opcional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para receber notificações e facilitar contato com clientes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Onde você atende?</h1>
                <p className="mt-2 text-muted-foreground">
                  Ajude seus clientes a encontrarem você
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade (opcional)</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (opcional)</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateField('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Você poderá adicionar endereço completo depois nas configurações do perfil.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Finish */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="size-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Tudo pronto!</h1>
                <p className="mt-2 text-muted-foreground">
                  Revise suas informações antes de finalizar
                </p>
              </div>

              <div className="rounded-xl border border-border divide-y divide-border">
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{formData.displayName}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">
                    {formData.category && PROFESSIONAL_CATEGORIES[formData.category as keyof typeof PROFESSIONAL_CATEGORIES]?.label}
                  </p>
                </div>
                {formData.phone && (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                )}
                {(formData.city || formData.state) && (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium">
                      {[formData.city, formData.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm">
                  <strong>Seu teste gratuito de 3 dias começa agora!</strong> Você terá acesso ao Plano Profissional (R$ 49,90/mês após o trial).
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Continuar
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Criar meu perfil
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
