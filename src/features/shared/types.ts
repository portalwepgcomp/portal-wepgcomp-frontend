/** Rótulo singular/plural do contador de itens de uma listagem. */
export interface RotuloContador {
  singular: string;
  plural: string;
}

/**
 * Ações que o usuário autenticado pode executar sobre um item de listagem.
 * Espelha `ListItemActions` do back (calculado no service via req.user).
 */
export interface AcoesItemLista {
  canEdit: boolean;
  canDelete: boolean;
  canDownload?: boolean;
  canReorderPresentations?: boolean;
}
