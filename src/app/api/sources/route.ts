import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSources,
  toggleSource,
  updateSourceInterval,
  addCustomSource,
  deleteSource,
} from '@/lib/source-service';
import { NewSourceInput } from '@/types/source';

// GET /api/sources - Listar todas as fontes de pesquisa
export async function GET() {
  try {
    const sources = await getAllSources();
    return NextResponse.json({
      success: true,
      sources,
      summary: {
        total: sources.length,
        active: sources.filter((s) => s.enabled).length,
        custom: sources.filter((s) => s.isCustom).length,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao listar fontes';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH /api/sources - Alternar estado ativo/desativo ou intervalo
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled, intervalHours } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'O ID da fonte é obrigatório' }, { status: 400 });
    }

    let updated = null;

    if (typeof enabled === 'boolean') {
      updated = await toggleSource(id, enabled);
    }

    if (typeof intervalHours === 'number') {
      updated = await updateSourceInterval(id, intervalHours);
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Fonte não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, source: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar fonte';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/sources - Adicionar nova fonte personalizada
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, baseUrl, searchUrlPattern, type, intervalHours, description } = body as NewSourceInput;

    if (!name || !baseUrl) {
      return NextResponse.json(
        { success: false, error: 'O nome do portal e o URL base são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação básica de URL
    try {
      new URL(baseUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'O URL base indicado não é válido (exemplo: https://exemplo.pt)' },
        { status: 400 }
      );
    }

    const created = await addCustomSource({
      name,
      baseUrl,
      searchUrlPattern: searchUrlPattern || `${baseUrl.replace(/\/$/, '')}/imoveis/{concelho}`,
      type: type || 'html',
      intervalHours: intervalHours || 12,
      description,
    });

    return NextResponse.json({ success: true, source: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao criar fonte';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/sources - Eliminar ou desativar fonte
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'O ID da fonte é obrigatório' }, { status: 400 });
    }

    const deleted = await deleteSource(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Fonte não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Fonte eliminada com sucesso' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao eliminar fonte';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
