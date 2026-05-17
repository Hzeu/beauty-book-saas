'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, MoreVertical, Clock, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createService,
  deleteService,
  listMyServices,
  toggleServiceActive,
  updateService,
} from '@/lib/actions/services'
import { formatCurrency, formatDuration } from '@/lib/helpers'
import type { Service, ServiceCategory } from '@/lib/types/database'
import { toast } from 'sonner'

interface ServicesContentProps {
  services: Service[]
  categories: ServiceCategory[]
}

const durations = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
  { value: '150', label: '2h 30min' },
  { value: '180', label: '3 horas' },
]

export function ServicesContent({ services, categories }: ServicesContentProps) {
  const [serviceList, setServiceList] = useState<Service[]>(services)
  const [categoryList, setCategoryList] = useState<ServiceCategory[]>(categories)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [createDuration, setCreateDuration] = useState('60')
  const [createCategoryId, setCreateCategoryId] = useState('none')
  const [editDuration, setEditDuration] = useState('60')
  const [editCategoryId, setEditCategoryId] = useState('none')
  const router = useRouter()

  useEffect(() => {
    setServiceList(services)
  }, [services])

  useEffect(() => {
    setCategoryList(categories)
  }, [categories])

  useEffect(() => {
    if (!editingService) return
    setEditDuration(String(editingService.duration_minutes))
    setEditCategoryId(editingService.category_id ?? 'none')
  }, [editingService])

  async function refreshServices() {
    const result = await listMyServices()
    if (result.error) {
      toast.error(result.error)
      return
    }
    setServiceList(result.services)
    setCategoryList(result.categories)
    router.refresh()
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set('duration', createDuration)
    formData.set('categoryId', createCategoryId)

    setIsLoading(true)
    try {
      const result = await createService(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Serviço criado com sucesso!')
        setIsOpen(false)
        setCreateDuration('60')
        setCreateCategoryId('none')
        await refreshServices()
      }
    } catch (error) {
      console.error('[services] createService client failure', error)
      toast.error(
        error instanceof Error
          ? `Erro inesperado ao criar serviço: ${error.message}`
          : 'Erro inesperado ao criar serviço.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    
    const result = await deleteService(id)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Serviço excluído!')
      await refreshServices()
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingService) return

    const formData = new FormData(event.currentTarget)
    formData.set('duration', editDuration)
    formData.set('categoryId', editCategoryId)

    setIsEditLoading(true)
    try {
      const result = await updateService(editingService.id, formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Serviço atualizado com sucesso!')
        setEditingService(null)
        await refreshServices()
      }
    } catch (error) {
      console.error('[services] updateService client failure', error)
      toast.error(
        error instanceof Error
          ? `Erro inesperado ao atualizar serviço: ${error.message}`
          : 'Erro inesperado ao atualizar serviço.',
      )
    } finally {
      setIsEditLoading(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const result = await toggleServiceActive(id, isActive)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isActive ? 'Serviço ativado!' : 'Serviço desativado!')
      await refreshServices()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {serviceList.length} serviço{serviceList.length !== 1 ? 's' : ''} cadastrado{serviceList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Novo Serviço</DialogTitle>
                <DialogDescription>
                  Adicione um novo serviço ao seu catálogo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do serviço *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Manicure Tradicional"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o serviço..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração *</Label>
                    <input type="hidden" name="duration" value={createDuration} />
                    <Select value={createDuration} onValueChange={setCreateDuration} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {categoryList.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <input type="hidden" name="categoryId" value={createCategoryId} />
                    <Select value={createCategoryId} onValueChange={setCreateCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categoryList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Criar Serviço'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      {serviceList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Comece adicionando os serviços que você oferece para seus clientes
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="mr-2 size-4" />
              Adicionar Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceList.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {service.name}
                    {!service.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingService(service)}>
                      <Pencil className="mr-2 size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(service.id, !service.is_active)}
                    >
                      <Power className="mr-2 size-4" />
                      {service.is_active ? 'Desativar' : 'Ativar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-4" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          {editingService && (
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Editar serviço</DialogTitle>
                <DialogDescription>Atualize os dados do serviço no seu catálogo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do serviço *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingService.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingService.description ?? ''}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Preço (R$) *</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingService.price}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duração *</Label>
                    <input type="hidden" name="duration" value={editDuration} />
                    <Select value={editDuration} onValueChange={setEditDuration} required>
                      <SelectTrigger id="edit-duration">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {categoryList.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-categoryId">Categoria</Label>
                    <input type="hidden" name="categoryId" value={editCategoryId} />
                    <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                      <SelectTrigger id="edit-categoryId">
                        <SelectValue placeholder="Sem categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categoryList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isEditLoading}>
                  {isEditLoading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
